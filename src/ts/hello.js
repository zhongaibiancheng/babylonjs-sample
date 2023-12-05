function promise(){
    let p = new Promise((resolve,reject)=>{
        // console.log("finished promise");
        // resolve({name:'zhangsan',age:10,sex:1});
        let rand = Math.random()*10;
        console.log(rand);
        if(rand >5){
            resolve({name:'zhangsan',age:10,sex:1});
        }else{
            reject("exception found now");
        }
        
    })
    return p;
}

