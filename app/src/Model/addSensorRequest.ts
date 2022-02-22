interface AddSensorRequest {
  sensorId: string;
  type: string; // TODO: Change to enum...
  ownerMail: string;
  ownerAccount: string;
  infrastructureMail?: string;
  infrastructureAccount?: string;
  iccid?: string;
  calibrationParams?: string;
  infrastructure_percentage?: number;
}

export default AddSensorRequest;