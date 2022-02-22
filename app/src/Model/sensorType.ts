import CalibrationParam from './calibrationParam';

interface SensorType {
  key: string;
  value: string;
  calibration_params?: CalibrationParam[];
}

export default SensorType;