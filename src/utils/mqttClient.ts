import mqtt from "mqtt";

const mqttClient = mqtt.connect(process.env.mqttbroker!);

export default mqttClient;
