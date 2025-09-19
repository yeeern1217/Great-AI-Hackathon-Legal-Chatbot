import boto3
import uuid
import os
import time
import requests

def transcribe_audio(audio_file_path: str, language_code: str):
    s3 = boto3.client('s3')
    transcribe = boto3.client('transcribe')

    bucket_name = os.getenv("AWS_S3_BUCKET_NAME")
    job_name = f"transcription-job-{uuid.uuid4()}"
    object_name = f"{job_name}.wav"

    s3.upload_file(audio_file_path, bucket_name, object_name)

    job_uri = f"s3://{bucket_name}/{object_name}"

    transcribe.start_transcription_job(
        TranscriptionJobName=job_name,
        Media={'MediaFileUri': job_uri},
        MediaFormat='wav',  
        LanguageCode=language_code,
        OutputBucketName=bucket_name
    )

    while True:
        status = transcribe.get_transcription_job(TranscriptionJobName=job_name)
        if status['TranscriptionJob']['TranscriptionJobStatus'] in ['COMPLETED', 'FAILED']:
            break
        time.sleep(5)

    if status['TranscriptionJob']['TranscriptionJobStatus'] == 'COMPLETED':
        transcript_uri = status['TranscriptionJob']['Transcript']['TranscriptFileUri']
        response = requests.get(transcript_uri)
        result = response.json()
        return result['results']['transcripts'][0]['transcript']
    else:
        raise Exception("Transcription failed")
