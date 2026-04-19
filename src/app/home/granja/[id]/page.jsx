"use client";

import { use, useEffect } from "react";

export default function granja({ params }){
    const {id} = use(params);
    return(
        <div>
            <h1 className="text-3xl">
                {id}
            </h1>
        </div>
    );
}