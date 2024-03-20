import { useEffect, useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
  Checkbox,
  Label,
} from 'dread-ui';

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
    missingFillInTheBlank: boolean;
  }) => void;
  count: number;
};

const WordFilters = ({ onFilter, count }: WordFiltersProps) => {
  const [filters, setFilters] = useState({
    missingDefinition: false,
    missingBlurb: false,
    missingBackground: false,
    missingExamples: false,
    missingFillInTheBlank: false,
  });

  const handleFilterChange = (field: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [field]: !prevFilters[field as keyof typeof prevFilters],
    }));
  };

  useEffect(() => {
    onFilter(filters);
  }, [filters, onFilter]);

  return (
    <Accordion type='single' collapsible>
      <AccordionItem value='filters'>
        <AccordionHeader>
          <AccordionTrigger className='px-4'>{`Filters${
            Object.values(filters).some((filter) => filter) ? '*' : ''
          } (${count})`}</AccordionTrigger>
        </AccordionHeader>
        <AccordionContent className='flex flex-col px-4'>
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
            <Filter
              id='missingFillInTheBlank'
              checked={filters.missingFillInTheBlank}
              onChange={() => handleFilterChange('missingFillInTheBlank')}
            >
              No Fill-in-the-Blanks
            </Filter>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export { WordFilters };
