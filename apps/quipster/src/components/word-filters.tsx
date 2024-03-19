import { useState } from 'react';
import { Button, Checkbox, Label } from 'dread-ui';

type FilterProps = {
  id: string;
  checked: boolean;
  onChange: () => void;
  children: React.ReactNode;
};
const Filter = ({ id, checked, onChange, children }: FilterProps) => {
  return (
    <div className='flex flex-nowrap gap-1'>
      <Checkbox id={id} checked={checked} onCheckedChange={onChange} />
      <Label htmlFor={id}>{children}</Label>
    </div>
  );
};

type WordFiltersProps = {
  onFilter: (filters: {
    missingDefinition: boolean;
    missingBlurb: boolean;
    missingBackground: boolean;
    missingExamples: boolean;
  }) => void;
};
const WordFilters = ({ onFilter }: WordFiltersProps) => {
  const [filters, setFilters] = useState({
    missingDefinition: false,
    missingBlurb: false,
    missingBackground: false,
    missingExamples: false,
  });

  const handleFilterChange = (field: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [field]: !prevFilters[field as keyof typeof prevFilters],
    }));
  };

  const handleApplyFilters = () => {
    onFilter(filters);
  };

  return (
    <div className='flex flex-col gap-2 p-4'>
      <h3 className='font-bold'>Filters</h3>
      <div className='space-y-2'>
        <Filter
          id='missingDefinition'
          checked={filters.missingDefinition}
          onChange={() => handleFilterChange('missingDefinition')}
        >
          No Definition
        </Filter>
        <Filter
          id='missingBlurb'
          checked={filters.missingBlurb}
          onChange={() => handleFilterChange('missingBlurb')}
        >
          No Blurb
        </Filter>
        <Filter
          id='missingBackground'
          checked={filters.missingBackground}
          onChange={() => handleFilterChange('missingBackground')}
        >
          No Background
        </Filter>
        <Filter
          id='missingExamples'
          checked={filters.missingExamples}
          onChange={() => handleFilterChange('missingExamples')}
        >
          No Examples
        </Filter>
      </div>
      <Button size='sm' onClick={handleApplyFilters} className='mt-2'>
        Apply Filters
      </Button>
    </div>
  );
};

export { WordFilters };
