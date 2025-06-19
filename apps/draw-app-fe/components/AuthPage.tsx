"use client";
import { Input } from "@repo/ui/input";
import { Button } from "@repo/ui/button";

export function AuthPage({ isSignin }: {
    isSignin: boolean
}) {
    return <div className="w-screen h-screen flex justify-center items-center">
        <div className="p-8 m-2 bg-white rounded-2xl">
            <h1 className="text-black text-2xl text-center font-bold my-2">{isSignin ? "Sign in" : "Sign up"}</h1>

            <div className="p-2 text-black  rounded">
                {/* <input type="text" placeholder="email"></input> */}
                <Input type="text" placeholder="Email" />
            </div>

            <div className="p-2 text-black">
                <Input type="password" placeholder="Password" />
            </div>

           <div className="p-2">
             {/* <button className="bg-black p-1 px-2 rounded" onClick={() => {
                
            }}>{isSignin ? "Sign in" : "Sign up"}</button> */}
                <Button className="bg-black p-1 px-2 rounded" onClick={()=>{
                    alert("Button clicked!"); 
                }} >{isSignin ? "Sign in" : "Sign up"}</Button>
           </div>
        </div>
    </div>
}