import React from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

const BasicMenu = ({ options, title }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = (fxn) => {
    setAnchorEl(null);
    if (fxn) fxn();
  };

  return (
    <div className='my-auto'>
      <Button
        // style={{ padding: '2px' }}
        id='basic-button'
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup='true'
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        {title}
      </Button>
      <Menu
        id='basic-menu'
        anchorEl={anchorEl}
        open={open}
        onClose={() => handleClose()}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        {/* <MenuList dense> */}
        {options.map(({ title, onClick }) => (
          <MenuItem key={title} onClick={() => handleClose(onClick)}>
            {title}
          </MenuItem>
        ))}
        {/* </MenuList> */}
      </Menu>
    </div>
  );
};

export default BasicMenu;
