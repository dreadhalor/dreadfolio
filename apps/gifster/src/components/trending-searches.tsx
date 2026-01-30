import { Button } from "dread-ui";
import { FaArrowTrendUp } from "react-icons/fa6";

type Props = {
  trendingSearches: string[];
  searchTerm: string;
  handleSearchTermClick: (term: string) => void;
};

const TrendingSearches = ({
  trendingSearches,
  searchTerm,
  handleSearchTermClick,
}: Props) => {
  return (
    <div className="flex w-full flex-wrap content-start items-center gap-2 text-xl">
      {trendingSearches.map((term) => (
        <Button
          key={term} // Add a key for each item
          variant={term === searchTerm ? "default" : "secondary"}
          size="sm"
          className="gap-1 px-2"
          onClick={() => handleSearchTermClick(term)}
        >
          <FaArrowTrendUp />
          {term}
        </Button>
      ))}
    </div>
  );
};

export { TrendingSearches };
