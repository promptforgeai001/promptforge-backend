import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";


function PaymentSuccess(){

const navigate = useNavigate();


useEffect(()=>{


const unsubscribe = onAuthStateChanged(
auth,
async(user)=>{


if(!user){

console.log("No user");

return;

}



console.log("UID:",user.uid);



await fetch(
"https://promptforge-backend-v8z7.onrender.com/upgrade-success",
{

method:"POST",

headers:{
"Content-Type":"application/json"
},


body:JSON.stringify({

uid:user.uid

})

}

);



console.log("Premium activated");



setTimeout(()=>{

navigate("/dashboard");

},2000);



});


return ()=>unsubscribe();



},[]);



return(

<div className="min-h-screen bg-black text-white flex items-center justify-center">

<h1 className="text-3xl font-bold">

Premium Activated 🚀

</h1>

</div>

)


}


export default PaymentSuccess;