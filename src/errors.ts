export class I18nError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'I18nError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}
