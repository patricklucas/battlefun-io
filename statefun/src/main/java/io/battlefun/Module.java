/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package io.battlefun;

import org.apache.flink.statefun.sdk.io.EgressIdentifier;
import org.apache.flink.statefun.sdk.io.IngressIdentifier;
import org.apache.flink.statefun.sdk.kafka.KafkaEgressBuilder;
import org.apache.flink.statefun.sdk.kafka.KafkaEgressSerializer;
import org.apache.flink.statefun.sdk.kafka.KafkaIngressBuilder;
import org.apache.flink.statefun.sdk.kafka.KafkaIngressDeserializer;
import org.apache.flink.statefun.sdk.spi.StatefulFunctionModule;

import com.google.protobuf.InvalidProtocolBufferException;
import io.battlefun.generated.FromGameFn;
import io.battlefun.generated.ToGameFn;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.producer.ProducerRecord;

import java.nio.charset.StandardCharsets;
import java.util.Map;

public final class Module implements StatefulFunctionModule {

  private static final String KAFKA_OUT_TOPIC_NAME = "from-statefun";
  
  private static final IngressIdentifier<ToGameFn> INPUT =
      new IngressIdentifier<>(ToGameFn.class, "io.battlefun", "in");
  private static final EgressIdentifier<FromGameFn> OUTPUT =
      new EgressIdentifier<>("io.battlefun", "out", FromGameFn.class);

  @Override
  public void configure(Map<String, String> globalConfiguration, Binder binder) {
    String kafkaBrokerAddress = globalConfiguration.getOrDefault("kafka", "kafka-broker:9092");

    // ingress ToGameFn messages from the "in" Kafka topic.
    binder.bindIngress(
        KafkaIngressBuilder.forIdentifier(INPUT)
            .withTopic("to-statefun")
            .withKafkaAddress(kafkaBrokerAddress)
            .withDeserializer(ToGameFnDeserializer.class)
            .withProperty(ConsumerConfig.GROUP_ID_CONFIG, "statefun")
            .build());

    // route ToGameFn message to the GameFn function
    binder.bindIngressRouter(INPUT, (msg, downstream) -> msg.getGameId());

    // bind the GameFn stateful function
    binder.bindFunctionProvider(GameFn.Type, unsued -> new GameFn());

    // egress FromGameFn to the "from" Kafka topic
    binder.bindEgress(
        KafkaEgressBuilder.forIdentifier(OUTPUT)
            .withKafkaAddress(kafkaBrokerAddress)
            .withSerializer(FromGameFnSerializer.class)
            .build());
  }

  private static final class ToGameFnDeserializer implements KafkaIngressDeserializer<ToGameFn> {

    @Override
    public ToGameFn deserialize(ConsumerRecord<byte[], byte[]> consumerRecord) {
      try {
        return ToGameFn.parseFrom(consumerRecord.value());
      } catch (InvalidProtocolBufferException e) {
        throw new IllegalStateException("Unparsable protobuf message", e);
      }
    }
  }

  private static final class FromGameFnSerializer implements KafkaEgressSerializer<FromGameFn> {

    @Override
    public ProducerRecord<byte[], byte[]> serialize(FromGameFn fromGameFn) {
      byte[] key = fromGameFn.getGameId().getBytes(StandardCharsets.UTF_8);
      byte[] value = fromGameFn.toByteArray();
      return new ProducerRecord<>(KAFKA_OUT_TOPIC_NAME, key, value);
    }
  }
}
