import string

from kafka import KafkaConsumer
import requests

KAFKA_ADDRESS = "kafka-broker:9092"
TOPIC = 'from-statefun'
ENDPOINT = "http://backend:8000/api/hack"

def main():
    consumer = KafkaConsumer(
        TOPIC,
        bootstrap_servers=[KAFKA_ADDRESS],
        auto_offset_reset='earliest',
        group_id='hack')


    for message in consumer:
        value = message.value
        r = requests.post(ENDPOINT, data=value, headers={'Content-Type': 'application/octet-stream'})

if __name__ == "__main__":
    main()
