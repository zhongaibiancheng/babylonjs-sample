function promise(){
    let p = new Promise((resolve,reject)=>{
        console.log("finished promise");
        resolve("resolve running");
    })
    return p;
}

promise();