import type { ReactNode } from "react";

import type { SkeletonResult } from "boneyard-js";
import { Skeleton as BoneyardSkeleton } from "boneyard-js/react";

const roseBones = "rgba(244, 63, 94, 0.14)";
const cardClass = "rounded-[1.75rem] border border-white/60 bg-white/75 shadow-lg";

const countdownBones: SkeletonResult = {
  name: "countdown-loading",
  viewportWidth: 1280,
  width: 960,
  height: 760,
  bones: [
    [27, 0, 46, 42, 18],
    [34, 70, 32, 18, 10],
    [18, 126, 64, 160, 24, true],
    [23, 150, 22, 48, 14],
    [52, 150, 22, 48, 14],
    [18, 312, 64, 210, 24, true],
    [18, 550, 64, 160, 24, true],
    [24, 574, 26, 20, 10],
    [18, 614, 64, 16, 8],
    [18, 646, 60, 16, 8],
    [18, 678, 48, 16, 8]
  ]
};

const todoBones: SkeletonResult = {
  name: "todos-loading",
  viewportWidth: 1280,
  width: 960,
  height: 720,
  bones: [
    [26, 0, 48, 38, 18],
    [34, 64, 32, 16, 8],
    [0, 126, 100, 560, 28, true],
    [4, 154, 22, 42, 14],
    [32, 154, 18, 18, 9],
    [56, 154, 20, 18, 9],
    [4, 226, 52, 44, 14],
    [60, 226, 18, 44, 14],
    [82, 226, 14, 44, 14],
    [4, 306, 92, 66, 20],
    [4, 388, 92, 66, 20],
    [4, 470, 92, 66, 20],
    [4, 552, 92, 66, 20]
  ]
};

const messagesBones: SkeletonResult = {
  name: "messages-loading",
  viewportWidth: 1280,
  width: 960,
  height: 760,
  bones: [
    [28, 0, 44, 38, 18],
    [36, 60, 28, 16, 8],
    [0, 120, 100, 318, 28, true],
    [37, 148, 26, 18, 9],
    [24, 188, 52, 44, 14],
    [24, 250, 52, 110, 18],
    [66, 378, 18, 42, 14],
    [30, 484, 40, 22, 10],
    [0, 532, 100, 92, 24],
    [0, 644, 100, 92, 24]
  ]
};

const galleryBones: SkeletonResult = {
  name: "gallery-loading",
  viewportWidth: 1280,
  width: 1120,
  height: 840,
  bones: [
    [30, 0, 40, 40, 18],
    [39, 64, 22, 16, 8],
    [0, 128, 18, 46, 14],
    [76, 128, 14, 18, 9],
    [0, 204, 30, 250, 24],
    [35, 204, 30, 250, 24],
    [70, 204, 30, 250, 24],
    [0, 478, 30, 250, 24],
    [35, 478, 30, 250, 24],
    [70, 478, 30, 250, 24],
    [32, 770, 36, 38, 18]
  ]
};

const relationshipBones: SkeletonResult = {
  name: "relationship-loading",
  viewportWidth: 1280,
  width: 1120,
  height: 860,
  bones: [
    [30, 0, 40, 40, 18],
    [38, 64, 24, 16, 8],
    [0, 126, 32, 156, 24],
    [34, 126, 32, 156, 24],
    [68, 126, 32, 156, 24],
    [0, 304, 32, 156, 24],
    [34, 304, 32, 156, 24],
    [68, 304, 32, 156, 24],
    [0, 490, 100, 190, 28, true],
    [4, 526, 18, 18, 9],
    [4, 570, 78, 16, 8],
    [4, 612, 64, 16, 8],
    [0, 714, 100, 110, 24]
  ]
};

const adventBones: SkeletonResult = {
  name: "advent-loading",
  viewportWidth: 1280,
  width: 1120,
  height: 930,
  bones: [
    [28, 0, 44, 42, 18],
    [37, 66, 26, 16, 8],
    [22, 116, 18, 44, 14],
    [76, 116, 24, 44, 14],
    [10, 194, 80, 16, 8],
    [10, 228, 80, 18, 10],
    [0, 274, 17, 116, 18],
    [20.75, 274, 17, 116, 18],
    [41.5, 274, 17, 116, 18],
    [62.25, 274, 17, 116, 18],
    [83, 274, 17, 116, 18],
    [0, 404, 17, 116, 18],
    [20.75, 404, 17, 116, 18],
    [41.5, 404, 17, 116, 18],
    [62.25, 404, 17, 116, 18],
    [83, 404, 17, 116, 18],
    [0, 534, 17, 116, 18],
    [20.75, 534, 17, 116, 18],
    [41.5, 534, 17, 116, 18],
    [62.25, 534, 17, 116, 18],
    [83, 534, 17, 116, 18],
    [0, 664, 17, 116, 18],
    [20.75, 664, 17, 116, 18],
    [41.5, 664, 17, 116, 18],
    [62.25, 664, 17, 116, 18],
    [83, 664, 17, 116, 18],
    [0, 794, 17, 116, 18],
    [20.75, 794, 17, 116, 18],
    [41.5, 794, 17, 116, 18],
    [62.25, 794, 17, 116, 18],
    [83, 794, 17, 116, 18]
  ]
};

const SkeletonFrame = ({
  bones,
  className,
  children
}: {
  bones: SkeletonResult;
  className?: string;
  children: ReactNode;
}) => (
  <BoneyardSkeleton
    loading
    initialBones={bones}
    animate="shimmer"
    color={roseBones}
    className={className}
    fallback={children}
  >
    {children}
  </BoneyardSkeleton>
);

export const CountdownSectionSkeleton = () => (
  <SkeletonFrame bones={countdownBones} className="mx-auto max-w-4xl">
    <div className="space-y-8">
      <div className="space-y-4 text-center">
        <div className="mx-auto h-11 w-[26rem] rounded-2xl bg-white/80" />
        <div className="mx-auto h-5 w-72 rounded-full bg-white/60" />
      </div>
      <div className={`${cardClass} h-40`} />
      <div className={`${cardClass} h-52`} />
      <div className={`${cardClass} h-40`} />
    </div>
  </SkeletonFrame>
);

export const TodoListSkeleton = () => (
  <SkeletonFrame bones={todoBones} className="mx-auto max-w-4xl">
    <div className="space-y-8">
      <div className="space-y-4 text-center">
        <div className="mx-auto h-10 w-[28rem] rounded-2xl bg-white/80" />
        <div className="mx-auto h-5 w-64 rounded-full bg-white/60" />
      </div>
      <div className={`${cardClass} space-y-6 p-6`}>
        <div className="flex items-center justify-between gap-4">
          <div className="h-11 w-52 rounded-xl bg-white/70" />
          <div className="h-5 w-44 rounded-full bg-white/70" />
          <div className="hidden h-5 w-32 rounded-full bg-white/60 md:block" />
        </div>
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="h-11 flex-1 rounded-xl bg-white/70" />
          <div className="h-11 w-full rounded-xl bg-white/70 md:w-44" />
          <div className="h-11 w-full rounded-xl bg-white/70 md:w-32" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-16 rounded-2xl bg-white/70" />
          ))}
        </div>
      </div>
    </div>
  </SkeletonFrame>
);

export const MessageFormSkeleton = () => (
  <SkeletonFrame bones={messagesBones} className="mx-auto max-w-4xl">
    <div className="space-y-8">
      <div className="space-y-4 text-center">
        <div className="mx-auto h-10 w-[22rem] rounded-2xl bg-white/80" />
        <div className="mx-auto h-5 w-60 rounded-full bg-white/60" />
      </div>
      <div className={`${cardClass} space-y-4 p-6`}>
        <div className="mx-auto h-5 w-44 rounded-full bg-white/70" />
        <div className="h-11 w-full rounded-xl bg-white/70" />
        <div className="h-28 w-full rounded-2xl bg-white/70" />
        <div className="ml-auto h-11 w-44 rounded-xl bg-white/70" />
      </div>
      <div className="space-y-5">
        <div className="mx-auto h-6 w-40 rounded-full bg-white/70" />
        {Array.from({ length: 2 }, (_, index) => (
          <div key={index} className={`${cardClass} h-24`} />
        ))}
      </div>
    </div>
  </SkeletonFrame>
);

export const PhotoGallerySkeleton = () => (
  <SkeletonFrame bones={galleryBones} className="mx-auto max-w-6xl">
    <div className="space-y-8">
      <div className="space-y-4 text-center">
        <div className="mx-auto h-10 w-[20rem] rounded-2xl bg-white/80" />
        <div className="mx-auto h-5 w-52 rounded-full bg-white/60" />
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="h-11 w-52 rounded-xl bg-white/70" />
        <div className="h-5 w-28 rounded-full bg-white/60" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className={`${cardClass} h-[15.5rem]`} />
        ))}
      </div>
      <div className="flex justify-center">
        <div className={`${cardClass} h-12 w-80`} />
      </div>
    </div>
  </SkeletonFrame>
);

export const RelationshipStatsSkeleton = () => (
  <SkeletonFrame bones={relationshipBones} className="mx-auto max-w-6xl">
    <div className="space-y-8">
      <div className="space-y-4 text-center">
        <div className="mx-auto h-10 w-[24rem] rounded-2xl bg-white/80" />
        <div className="mx-auto h-5 w-64 rounded-full bg-white/60" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className={`${cardClass} h-36`} />
        ))}
      </div>
      <div className={`${cardClass} h-48`} />
      <div className={`${cardClass} h-28`} />
    </div>
  </SkeletonFrame>
);

export const AdventCalendarSkeleton = () => (
  <SkeletonFrame bones={adventBones} className="container mx-auto p-6">
    <div className="space-y-8">
      <div className="space-y-4 text-center">
        <div className="mx-auto h-12 w-[20rem] rounded-2xl bg-white/80" />
        <div className="mx-auto h-5 w-56 rounded-full bg-white/60" />
        <div className="flex items-center justify-center gap-4">
          <div className="h-11 w-40 rounded-xl bg-white/70" />
          <div className="h-11 w-52 rounded-xl bg-white/70" />
        </div>
      </div>
      <div className={`${cardClass} space-y-4 p-4`}>
        <div className="h-4 w-64 rounded-full bg-white/70" />
        <div className="h-4 w-full rounded-full bg-white/60" />
      </div>
      <div className="grid grid-cols-5 gap-3">
        {Array.from({ length: 25 }, (_, index) => (
          <div key={index} className={`${cardClass} aspect-square`} />
        ))}
      </div>
    </div>
  </SkeletonFrame>
);
