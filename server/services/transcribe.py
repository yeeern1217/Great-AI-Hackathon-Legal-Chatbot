import boto3
import uuid
import time
import json

def transcribe_audio(audio_file_path: str, language: str, keep_audio: bool = True):
    s3 = boto3.client('s3')
    transcribe = boto3.client('transcribe')

    bucket_name = "audio-file-temp"
    job_name = f"transcription-job-{uuid.uuid4()}"
    audio_object_name = f"{job_name}.wav"
    transcript_object_key = f"{job_name}.json"

    # Upload audio to S3
    s3.upload_file(audio_file_path, bucket_name, audio_object_name)
    job_uri = f"s3://{bucket_name}/{audio_object_name}"

    # Start transcription job
    transcribe.start_transcription_job(
        TranscriptionJobName=job_name,
        Media={'MediaFileUri': job_uri},
        MediaFormat='wav',
        LanguageCode=language,
        OutputBucketName=bucket_name,
        OutputKey=transcript_object_key
    )

    # Wait for job to complete
    while True:
        status = transcribe.get_transcription_job(TranscriptionJobName=job_name)
        job_status = status['TranscriptionJob']['TranscriptionJobStatus']
        if job_status in ['COMPLETED', 'FAILED']:
            break
        time.sleep(5)

    if job_status == 'FAILED':
        failure_reason = status['TranscriptionJob'].get('FailureReason', 'No reason provided.')
        if not keep_audio:
            s3.delete_object(Bucket=bucket_name, Key=audio_object_name)
        raise Exception(f"Transcription failed: {failure_reason}")

    # Fetch transcript directly from S3
    try:
        obj = s3.get_object(Bucket=bucket_name, Key=transcript_object_key)
        result = json.loads(obj['Body'].read())
        text = result['results']['transcripts'][0]['transcript']
    except Exception as e:
        print(f"Error reading transcript: {e}")
        text = "Sorry, I could not understand the audio. Please try again."

    # Clean up transcript JSON only
    s3.delete_object(Bucket=bucket_name, Key=transcript_object_key)
    
    return text
