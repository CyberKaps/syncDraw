import { initDraw } from "@/draw";
import { useEffect, useRef } from "react";

export function Canvas({ roomId }: {
    roomId: string;
}) {

    const canvasRef = useRef<HTMLCanvasElement>(null);
    

    useEffect(() => {

        if(canvasRef.current) {
            
            initDraw(canvasRef.current, roomId);
        }



    }, [canvasRef])


    return <div>
        <canvas ref={canvasRef} height={1000} width={2000}></canvas>

    </div>


}