# new-python-ai-service/main.py
import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

# LangChain imports
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage # For conversation history formatting

# Load environment variables
# load_dotenv()

# --- FastAPI App Setup ---
app = FastAPI(
    title="SETGuru AI Service",
    description="Provides emotional intelligence and Socratic questioning AI capabilities."
)

# --- LLM Provider Configuration ---
# Retrieve API keys
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Function to get the LLM based on provider name
def get_llm(provider: str):
    if provider == "google":
        if not GOOGLE_API_KEY:
            raise ValueError("GOOGLE_API_KEY environment variable not set for Google provider.")
        return ChatGoogleGenerativeAI(
            model=os.getenv("GEMINI_MODEL_NAME", "gemini-1.5-flash-latest"),
            google_api_key=GOOGLE_API_KEY,
            temperature=0.7, # Adjust temperature as needed
            # Explicitly ask for JSON output for Google Generative AI
            # This is a key part of ensuring JSON response for the emotion analysis
            client_options={"api_key": GOOGLE_API_KEY}, # Required for proper API key passing to Gemini client
            convert_system_message_to_human=True # Often helpful for models expecting strict turn-taking
        )
    elif provider == "openai":
        if not OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY environment variable not set for OpenAI provider.")
        return ChatOpenAI(
            model=os.getenv("OPENAI_MODEL_NAME", "gpt-4o"), # e.g., gpt-3.5-turbo, gpt-4o
            openai_api_key=OPENAI_API_KEY,
            temperature=0.7,
            # Explicitly ask for JSON mode for OpenAI
            # This is critical for OpenAI models when expecting JSON output.
            model_kwargs={"response_format": {"type": "json_object"}}
        )
    else:
        raise ValueError(f"Unsupported LLM provider: {provider}")

# --- IMPORTANT CHANGE: Remove global 'model' initialization ---
# model = get_llm(CURRENT_LLM_PROVIDER) # This line should be removed or commented out.
# The LLM will be obtained dynamically inside each endpoint based on input_data.provider.


# --- Pydantic Models for Request/Response (remains the same) ---
class ConversationTurn(BaseModel):
    type: str # "user" or "tutor"
    content: str

class AnalyzeEmotionInput(BaseModel):
    message: str
    provider: str = "google" # Add a provider selection to the input model

class AnalyzeEmotionOutput(BaseModel):
    emotion: str # "frustrated", "confused", "confident", "excited", "neutral"
    adaptedResponse: str

class SocraticQuestioningInput(BaseModel):
    message: str
    subject: str
    gradeLevel: int
    emotion: str
    tutoringStyle: str = "standard"
    conversationHistory: list[ConversationTurn] = []
    provider: str = "google" # Add a provider selection to the input model

class SocraticQuestioningOutput(BaseModel):
    question: str

# --- API Endpoints ---

@app.post("/ai/analyze-emotion", response_model=AnalyzeEmotionOutput)
async def analyze_emotion_endpoint(input_data: AnalyzeEmotionInput):
    llm = get_llm(input_data.provider) # Get LLM instance here

    # --- MODIFIED PROMPT: Explicitly instruct for JSON output ---
    system_prompt = """You are an AI tutor that detects the emotion of the student from their message and adapts your response accordingly.

    Based on the student's emotion, adapt your response to provide encouragement, suggest breaks, or simplify the problem.

    The detected emotion MUST be one of the following: frustrated, confused, confident, excited, neutral.

    Your response MUST be a JSON object with two keys: "emotion" (string) and "adaptedResponse" (string).
    Example: {"emotion": "confident", "adaptedResponse": "That's a great start! Let's keep building on that."}
    Do not include any other text or formatting outside the JSON object.
    """

    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=f"Message: {input_data.message}")
    ]

    try:
        response = await llm.ainvoke(messages)
        output_content = response.content.strip() # .strip() helps remove leading/trailing whitespace

        import json
        parsed_output = json.loads(output_content) # Attempt to parse JSON
        
        return AnalyzeEmotionOutput(emotion=parsed_output["emotion"], adaptedResponse=parsed_output["adaptedResponse"])
    except json.JSONDecodeError as e:
        print(f"JSON Decode Error in analyze_emotion_endpoint: {e}")
        print(f"Model output that caused error: '{output_content}'")
        raise HTTPException(status_code=500, detail=f"AI model did not return valid JSON for emotion analysis: {output_content}")
    except Exception as e:
        print(f"General Error in analyze_emotion_endpoint: {e}")
        raise HTTPException(status_code=500, detail="Error processing emotion analysis.")


@app.post("/ai/socratic-question", response_model=SocraticQuestioningOutput)
async def socratic_question_endpoint(input_data: SocraticQuestioningInput):
    llm = get_llm(input_data.provider) # Get LLM instance here

    tutoring_style_guide = "standard"
    if input_data.tutoringStyle == 'simpler':
        tutoring_style_guide = "use very clear, straightforward language and break down problems into smaller, more manageable steps. Focus on foundational understanding and ask very direct (but still Socratic) questions."
    elif input_data.tutoringStyle == 'moreDepth':
        tutoring_style_guide = "ask questions that push for deeper conceptual understanding, encourage making connections to broader topics, or prompt consideration of alternative viewpoints or implications, while still being mindful not to overwhelm."
    else: # Standard
        tutoring_style_guide = "continue with a balanced Socratic approach suitable for their grade level and subject, ensuring questions are purposeful."

    # --- MODIFIED PROMPT: Explicitly instruct for JSON output ---
    full_socratic_prompt = f"""You are an AI tutor using the Socratic method to help students learn. You NEVER give direct answers, but instead ask guiding questions to help the student discover the answer themselves. Your primary goal is to be an *empathetic and patient guide*.

The student is currently in grade {input_data.gradeLevel} and is studying {input_data.subject}.
The student is feeling {input_data.emotion}. Your tone should *always* be encouraging, understanding, and supportive. If the student expresses frustration or confusion, acknowledge their feeling in a gentle, validating way (e.g., "I see this part might be a bit tricky," or "It's understandable to feel that way, let's break it down further.") before asking your next *carefully considered* guiding question. Your aim is to build their confidence and make the learning process positive.

If the student's message, the detected emotion (especially 'frustrated' or 'confused'), or the conversation history suggests they are struggling or stuck, intensify your efforts to help them. Your guiding question should then thoughtfully incorporate one of these adaptive strategies to *gently lead them forward*:
1.  **Simplify Further**: Ask an even more fundamental question that breaks the problem down into its smallest, most manageable parts. Ensure this simplified question still encourages their thinking and feels like a natural next step.
2.  **Subtle Socratic Hint**: Gently steer them by asking a question that hints at a relevant principle, a different perspective, or a simpler analogous problem (e.g., "What if we first considered a scenario with fewer variables?" or "Does the concept of X shed any light on this part?"). The hint should still require them to make the connection and not be a thinly veiled answer.
3.  **Prerequisite Check**: If it seems a foundational concept is a blocker, your question could be a gentle probe or offer to revisit it (e.g., "To make sure we're on solid ground, how comfortable do you feel with Y right now? Sometimes a quick review of that can help unlock these trickier problems. Would that be helpful?").
Always frame these as questions. Your primary goal is still to guide with *essential* questions, not to give answers. Use these adaptive techniques to help the student overcome the immediate hurdle and progress in their understanding. Avoid asking multiple questions at once; focus on one clear, guiding question that builds on their last response.

Additionally, tailor your questioning approach based on the student's preferred style: '{input_data.tutoringStyle}'. If the style is 'simpler', {tutoring_style_guide}. If the style is 'standard', {tutoring_style_guide}. If the style is 'moreDepth', {tutoring_style_guide}.

Use the following conversation history to provide context-aware questions:
"""

    langchain_history_messages = []
    for turn in input_data.conversationHistory:
        if turn.type == "user":
            langchain_history_messages.append(HumanMessage(content=turn.content))
        else:
            langchain_history_messages.append(AIMessage(content=turn.content))
    
    messages = [
        SystemMessage(content=full_socratic_prompt),
    ] + langchain_history_messages + [
        HumanMessage(content=f"Student message: {input_data.message}\n\n"
                     "Your response MUST be a JSON object with a single key: \"question\" (string).\n"
                     "Example: {\"question\": \"What is your initial thought on how to approach this problem?\"}\n"
                     "Do not include any other text or formatting outside the JSON object.\n"
                     "Question: ")
    ]
    
    try:
        response = await llm.ainvoke(messages)
        output_content = response.content.strip() # .strip() helps remove leading/trailing whitespace

        import json
        parsed_output = json.loads(output_content) # Attempt to parse JSON
        
        return SocraticQuestioningOutput(question=parsed_output["question"])
    except json.JSONDecodeError as e:
        print(f"JSON Decode Error in socratic_question_endpoint: {e}")
        print(f"Model output that caused error: '{output_content}'")
        raise HTTPException(status_code=500, detail=f"AI model did not return valid JSON for socratic question: {output_content}")
    except Exception as e:
        print(f"General Error in socratic_question_endpoint: {e}")
        raise HTTPException(status_code=500, detail="Error generating socratic question.")