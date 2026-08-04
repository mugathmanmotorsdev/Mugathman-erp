import { useMemo } from "react";

export function 
useFormatCurrency(amount: number) {
    const shortAmount = useMemo(() => {
        if (amount > 1_000_000_000_000) {
            return (amount / 1_000_000_000_000).toFixed(2);
        }
        if (amount > 1_000_000_000) {
            return (amount / 1_000_000_000).toFixed(2);
        }
        if (amount > 1_000_000) {
            return (amount / 1_000_000).toFixed(2);
        }
        return amount.toFixed(2);
    }, [amount]);

    const unit = useMemo(() => {
        if (amount > 1_000_000_000_000) return "T";
        if (amount > 1_000_000_000) return "B";
        if (amount > 1_000_000) return "M";
        return "";
    }, [amount]);

    const formattedAmount = useMemo(() => {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
            maximumFractionDigits: 2,
        }).format(Number(shortAmount));
    }, [shortAmount]);

    const formattedAmountWithUnit = `${formattedAmount}${unit}`;

    return { shortAmount, formattedAmount, unit, formattedAmountWithUnit };
}
