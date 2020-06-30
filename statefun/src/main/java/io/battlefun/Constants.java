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

import io.battlefun.generated.FromGameFn;
import io.battlefun.generated.ToGameFn;

public class Constants {

  static final String KAFKA_OUT_TOPIC_NAME = "from-statefun";

  static final IngressIdentifier<ToGameFn> INPUT =
      new IngressIdentifier<>(ToGameFn.class, "io.battlefun", "in");
  static final EgressIdentifier<FromGameFn> OUTPUT =
      new EgressIdentifier<>("io.battlefun", "out", FromGameFn.class);
}
