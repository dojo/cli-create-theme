export default function flattenArray(list: any[]): any[] {
	return list.reduce((a: any[], b: any) => {
		return a.concat(Array.isArray(b) ? flattenArray(b) : b);
	}, []);
}
