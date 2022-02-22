interface CalibrationParam {
  name: string,
  type: 'string' | 'number' | 'object'
  default?: string | number,
  children?: CalibrationParam[]
}

export default CalibrationParam;