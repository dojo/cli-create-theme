export function info(message?: any, ...optionalParams: any[]) {
	console.info.apply(console, Array.prototype.slice.call(arguments));
}
