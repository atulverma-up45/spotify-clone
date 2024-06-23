'use client'

import useLoadImage from "@/hooks/useLoadImage";
import { Song } from "@/types/types"
import Image from "next/image";
import React from "react";
import PlayButton from "./PlayButton";

interface SongItemProps {
    data: Song;
    onClick: (id: string) => void
}


const SongItem: React.FC<SongItemProps> = ({
    onClick, data
}) => {

    console.log("data", data);

    const imagePath = useLoadImage(data);
    return (
        <div onClick={() => onClick(data.id)} className="relative group flex flex-col items-center justify-center rounded-md overflow-hidden border-x-gray-400 bg-neutral-400/5 cursor-pointer hover:bg-neutral-400/10 trasition p-3
        ">
            <div className="relative aspect-square w-full h-full rounded-md overflow-hidden">
                <Image
                    className="object-cover"
                    src={imagePath || '/images/liked.jpg'}
                    alt={data.title}
                    fill
                />
            </div>
            <div className="flex flex-col items-start w-full pt-4 gap-y-1">
                <p className="font-semibold truncate w-full">
                    {data.title}
                </p>
                <p className="text-neutral-400 text-sm pb-4 w-full truncate
                    ">
                    By - {data.author}
                </p>
            </div>
            <div className="absolute bottom-24 right-5">
                <PlayButton />
            </div>

        </div>
    )
}

export default SongItem