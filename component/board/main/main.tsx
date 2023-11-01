import styles from "./main.module.css";
import Image from "next/image";
import DogImage from "@/public/image/dog.svg";
import CatImage from "@/public/image/cat.svg";
import { useEffect, useState } from "react";
import { MessageInfo } from "@/model/message";
import BubbleLeftImage from "@/public/image/bubble_left.svg";
import BubbleRightImage from "@/public/image/bubble_right.svg";
import { DailyInfo } from "@/model/info";

type GetNewMessageProps = {
  catLastCreatedAt: Date;
  dogLastCreatedAt: Date;
};

type GetNewMessageResult = {
  dogMessages: MessageInfo[];
  catMessages: MessageInfo[];
};

const getMessages = async ({
  catLastCreatedAt,
  dogLastCreatedAt,
}: GetNewMessageProps): Promise<GetNewMessageResult> => {
  try {
    const url = `${
      process.env.NEXT_PUBLIC_API
    }/board?catLastCreatedAt=${catLastCreatedAt.toString()}&dogLastCreatedAt=${dogLastCreatedAt.toString()}`;
    const response = await fetch(url, { method: "GET", cache: "no-cache" });
    const result = (await response.json()) as GetNewMessageResult;
    return result;
  } catch (e) {
    return { dogMessages: [], catMessages: [] };
  }
};

export default function BoardMain() {
  const [dailyInfo, setDailyInfo] = useState({ day: 1, fund: 0 } as DailyInfo);
  const [dogShowMessages, setDogShowMessages] = useState([] as MessageInfo[]);
  const [catShowMessages, setCatShowMessages] = useState([] as MessageInfo[]);

  useEffect(() => {
    getDailyInfo();

    async function getDailyInfo() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API}/daily`, {
          method: "GET",
          cache: "no-cache",
        });

        const data = (await response.json()) as DailyInfo;
        setDailyInfo(data);
      } catch (e) {
        console.log(e);
      }
    }
  }, []);

  useEffect(() => {
    const dogMessages = [] as MessageInfo[];
    const catMessages = [] as MessageInfo[];

    let dogLastCreatedAt = new Date(2023, 9, 30);
    let catLastCreatedAt = new Date(2023, 9, 30);

    fetching();

    const polling = setInterval(fetching, 30000);
    return () => clearInterval(polling);

    async function fetching() {
      const newMessages = await getMessages({
        catLastCreatedAt: catLastCreatedAt,
        dogLastCreatedAt: dogLastCreatedAt,
      });

      if (newMessages.dogMessages.length > 0) {
        const newDogMessages = newMessages.dogMessages.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getDate()
        );
        dogMessages.push(...newDogMessages);
        const lastDog = newDogMessages.pop();
        if (lastDog) {
          dogLastCreatedAt = lastDog.createdAt;
        }
      }

      if (newMessages.catMessages.length > 0) {
        const newCatMessages = newMessages.catMessages.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getDate()
        );
        catMessages.push(...newCatMessages);
        const lastCat = newCatMessages.pop();
        if (lastCat) {
          catLastCreatedAt = lastCat.createdAt;
        }
      }

      const newDogShowMessages = dogMessages.splice(
        0,
        Math.min(3, dogMessages.length)
      );
      setDogShowMessages(newDogShowMessages);

      const newCatShowMessages = catMessages.splice(
        0,
        Math.min(3, catMessages.length)
      );
      setCatShowMessages(newCatShowMessages);
    }
  }, []);

  return (
    <div className={styles.main}>
      <div className={styles.dog}>
        <div className={styles.dogImage}>
          <Image src={DogImage} alt="댕댕이" fill priority sizes="l" />
        </div>
        {dogShowMessages[0] && (
          <Bubble animal="dog" num={1} message={dogShowMessages[0]} />
        )}
        {dogShowMessages[1] && (
          <Bubble animal="dog" num={2} message={dogShowMessages[1]} />
        )}
        {dogShowMessages[2] && (
          <Bubble animal="dog" num={3} message={dogShowMessages[2]} />
        )}
      </div>
      <div className={styles.cat}>
        <div className={styles.catImage}>
          <Image src={CatImage} alt="냥냥이" fill priority sizes="l" />
        </div>
        {catShowMessages[0] && (
          <Bubble animal="cat" num={1} message={catShowMessages[0]} />
        )}
        {catShowMessages[1] && (
          <Bubble animal="cat" num={2} message={catShowMessages[1]} />
        )}
        {catShowMessages[2] && (
          <Bubble animal="cat" num={3} message={catShowMessages[2]} />
        )}
      </div>
      <div className={styles.dailyInfo}>
        <h1 className={styles.dailyInfoText}>
          {dailyInfo.day}일 차 누적 기부금: {dailyInfo.fund}원
        </h1>
      </div>
    </div>
  );
}

type BubbleProps = {
  animal: "dog" | "cat";
  num: 1 | 2 | 3;
  message: MessageInfo;
};

function Bubble({ animal, num, message }: BubbleProps) {
  const getBubbleStyle = () => {
    switch (animal) {
      case "dog":
        switch (num) {
          case 1:
            return styles.dogBubble1;
          case 2:
            return styles.dogBubble2;
          case 3:
            return styles.dogBubble3;
        }
      case "cat":
        switch (num) {
          case 1:
            return styles.catBubble1;
          case 2:
            return styles.catBubble2;
          case 3:
            return styles.catBubble3;
        }
    }
  };
  return (
    <div className={getBubbleStyle()}>
      <Image
        src={animal === "dog" ? BubbleLeftImage : BubbleRightImage}
        alt="bubble"
        fill
        priority
        sizes="m"
      />
      <div className={styles.bubbleText}>{message.message}</div>
    </div>
  );
}