import { useEffect, useState } from "react";

export function useFormatCurrency(amount: number) {
    const [shortAmount, setShortAmount] = useState<string>("");
    const [formattedAmount, setFormattedAmount] = useState<string>("");
    const [unit, setUnit] = useState<string>("");

    useEffect(() => {
        let short: string;
        let unitLabel: string;

        if (amount > 1_000_000_000_000) {
            short = (amount / 1_000_000_000_000).toFixed(2);
            unitLabel = "T";
        } else if (amount > 1_000_000_000) {
            short = (amount / 1_000_000_000).toFixed(2);
            unitLabel = "B";
        } else if (amount > 1_000_000) {
            short = (amount / 1_000_000).toFixed(2);
            unitLabel = "M";
        } else {
            short = amount.toFixed(2);
            unitLabel = "";
        }

        setShortAmount(short);
        setUnit(unitLabel);
        setFormattedAmount(new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
            maximumFractionDigits: 2,
        }).format(Number(short)));
    }, [amount]);

    const formattedAmountWithUnit = `${formattedAmount}${unit}`;

    return { shortAmount, formattedAmount, unit, formattedAmountWithUnit };
}   