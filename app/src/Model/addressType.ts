export default interface IAddress {
  [key: string]: string | number | undefined,
  floor?: string,
  contact_id?: number
  address?: string,
  postcode?: string,
  city?: string,
  province?: string,
  country?: string,
  id?: number
}