import React,{useEffect,useState} from "react";
import {useParams,useNavigate} from "react-router-dom";
import api from '../../api';

export default function NegotiateRequest(){

 const {id}=useParams();
 const nav=useNavigate();

 const [request,setRequest]=useState(null);
 const [amount,setAmount]=useState(1000);

 useEffect(()=>{
   api.getRequest(id).then(r=>{
     setRequest(r);
     setAmount(r.budget);
   });
 },[id]);

 const sendQuote=()=>{
   api.updateRequestStatus(id,"NEGOTIATED",amount);
   nav("/editor/work-requests");
 };

 if(!request) return <div>Loading...</div>;

 return(
 <div className="container mt-4">

  <div className="card shadow">
   <div className="card-body">

    <h4>Negotiate Price</h4>

    <p><strong>{request.service}</strong></p>

    <h3 className="text-primary">
      ₹ {amount}
    </h3>

    <input
      type="range"
      min="500"
      max="20000"
      step="100"
      value={amount}
      onChange={(e)=>setAmount(e.target.value)}
      className="form-range"
    />

    <button
      className="btn btn-warning mt-3"
      onClick={sendQuote}
    >
      Send Negotiated Quote
    </button>

   </div>
  </div>

 </div>
 );
}