export function throttle(milisegundos = 500) {

  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {

    const metodoOriginal = descriptor.value
    let timer = 0

    descriptor.value = function(...args: any[]) {
      
      clearTimeout(timer)
      timer = setTimeout(() => metodoOriginal.apply(this, args)
      , milisegundos)
    }

    return descriptor
  }
}