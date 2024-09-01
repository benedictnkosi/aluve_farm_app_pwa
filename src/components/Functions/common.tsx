import { Timestamp } from "firebase/firestore";

export function formatAmount(amount: number): string {
    const absAmount = Math.abs(amount);
    let formatted: string;

    if (absAmount >= 1_000_000_000) {
      formatted = (absAmount / 1_000_000_000).toFixed(0) + " B";
    } else if (absAmount >= 1_000_000) {
      formatted = (absAmount / 1_000_000).toFixed(0) + " M";
    } else if (absAmount >= 1_000) {
      formatted = (absAmount / 1_000).toFixed(0) + " K";
    } else {
      formatted = absAmount.toFixed(0);
    }

    return amount < 0 ? `-${formatted}` : formatted;
  }

  export const formatDate = (timestamp: Timestamp | string): string => {
    const date =
      typeof timestamp === "string" ? new Date(timestamp) : timestamp.toDate();
    const formattedDate = date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return formattedDate;
  };

  export  const formatShortDate = (timestamp: Timestamp | string): string => {
    const date =
      typeof timestamp === "string" ? new Date(timestamp) : timestamp.toDate();
    const formattedDate = date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long"
    });
    return formattedDate;
  };
