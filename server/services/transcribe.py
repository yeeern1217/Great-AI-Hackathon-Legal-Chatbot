import boto3
import uuid
import time
import requests
import json

def transcribe_audio(audio_file_path: str, language: str):
    transcribe = boto3.client('transcribe')
    s3 = boto3.client('s3')

    # Generate unique job name
    job_name = f"transcription-job-{uuid.uuid4()}"
    
    # Upload audio to a temporary S3 bucket
    bucket_name = "audio-file-temp"
    audio_object_name = f"{job_name}.wav"
    s3.upload_file(audio_file_path, bucket_name, audio_object_name)
    job_uri = f"s3://{bucket_name}/{audio_object_name}"

    # Start transcription job
    transcribe.start_transcription_job(
        TranscriptionJobName=job_name,
        Media={'MediaFileUri': job_uri},
        MediaFormat='wav',
        LanguageCode=language
    )

    # Poll for job completion
    while True:
        status = transcribe.get_transcription_job(TranscriptionJobName=job_name)
        job_status = status['TranscriptionJob']['TranscriptionJobStatus']
        if job_status in ['COMPLETED', 'FAILED']:
            break
        time.sleep(2)  

    # Clean up the audio file from S3
    s3.delete_object(Bucket=bucket_name, Key=audio_object_name)

    if job_status == 'FAILED':
        failure_reason = status['TranscriptionJob'].get('FailureReason', 'No reason provided.')
        raise Exception(f"Transcription failed: {failure_reason}")

    # Fetch transcript JSON from AWS Transcribe directly
    transcript_uri = status['TranscriptionJob']['Transcript']['TranscriptFileUri']
    response = requests.get(transcript_uri)
    text = ""

    try:
        result = response.json()
        text = result['results']['transcripts'][0]['transcript']
    except (json.JSONDecodeError, KeyError, IndexError) as e:
        print(f"Error processing transcript JSON: {e}")
        print(f"Response status: {response.status_code}")
        print(f"Response content: {response.text}")
        text = "Sorry, I could not understand the audio. Please try again."

    return text