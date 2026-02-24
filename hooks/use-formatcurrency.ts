import { useEffect, useState } from "react";

export function useFormatCurrency(amount: number) {
    const [shortAmount, setShortAmount] = useState<string>("");
    const [formattedAmount, setFormattedAmount] = useState<string>("");
    const [unit, setUnit] = useState<string>("");



    useEffect(() => {
        if (amount > 1000000000000) {
            setShortAmount((amount / 1000000000000).toFixed(2));
            setUnit("T");
        } else if (amount > 1000000000) {
            setShortAmount((amount / 1000000000).toFixed(2));
            setUnit("B");
        } else if (amount > 1000000) {
            setShortAmount((amount / 1000000).toFixed(2));
            setUnit("M");
        } else {
            setShortAmount(amount.toFixed(2));
            setUnit("");
        }
        setFormattedAmount(new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
            maximumFractionDigits: 2,
        }).format(Number(shortAmount)));
    }, [amount, shortAmount]);

    const formattedAmountWithUnit = `${formattedAmount}${unit}`;

    return { shortAmount, formattedAmount, unit, formattedAmountWithUnit };
}   