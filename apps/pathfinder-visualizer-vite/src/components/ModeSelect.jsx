import React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

const ModeSelect = ({ modeRef, renderParent }) => {
  const handleChange = (event) => {
    modeRef.current = event.target.value;
    renderParent();
  };
  return (
    <Box sx={{ minWidth: 60 }} className='my-auto ml-4 mr-2'>
      <FormControl fullWidth variant='standard'>
        <InputLabel id='mode-select-label'>Tile Type</InputLabel>
        <Select
          labelId='mode-select-label'
          label='Tile Type'
          onChange={handleChange}
          value={modeRef.current}
        >
          <MenuItem value={1}>Start</MenuItem>
          <MenuItem value={2}>End</MenuItem>
          <MenuItem value={3}>Wall</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default ModeSelect;
