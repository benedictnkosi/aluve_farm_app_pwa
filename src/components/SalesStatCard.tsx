import {  Card } from "flowbite-react";

interface TopSalesCardProps {
  amount: string;
  description: string,
}

const SalesStatCard: React.FC<TopSalesCardProps> = ({
  amount,
  description,
}) => {
  return (
    <Card
    className="w-full sm:w-36 mb-5" // Use w-full for small screens and w-36 for larger screens
    horizontal
        >
          <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {amount}
          </h5>
          <p className="font-normal text-gray-700 dark:text-gray-400">
          {description}
          </p>
        </Card>
  );
};

export default SalesStatCard;