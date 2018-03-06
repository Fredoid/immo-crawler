var promise = require('promise');
/*
class promise extends basePromise {
	constructor(func){
		super(func);
		console.log(this.catch);
		this.catch(function(error){
			return basePromise.reject(error);		
		})
	}
} 
*/


var createPromise = function(func){
	var prom = new promise(func);
	prom.catch(promise.reject);
	return prom;
}

var test = function(){
	return createPromise(function (resolve, reject) {
		throw new Error("Error in promise");		
		
		resolve("test result");	
	});
}

console.log("Promise start");
test().then(function(result){
	console.log("Promise finishes:", result);
}, function(error){
	console.log("Error occured", error);
});
