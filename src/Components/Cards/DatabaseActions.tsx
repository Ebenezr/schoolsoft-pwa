import React, { useState } from 'react';
import {
  Dialog,
  Button,
  DialogActions,
  DialogContentText,
  DialogTitle,
  DialogContent,
  TextField,
} from '@mui/material';

import { useIsAuthenticated } from '../../utils/hooks/localstorage';

const DatabaseActions = () => {
  const { userId } = useIsAuthenticated();

  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  // const [action, setAction] =
  //   (useState < null) | 'partial' | 'reservations' | ('reset' > null);

  const [action, setAction] = useState(null);
  const [message, setMessage] = useState('');

  const handlePasswordDialogOpen = (action) => {
    setAction(action);
    setPasswordDialogOpen(true);
  };

  const handlePasswordDialogClose = () => {
    setPasswordDialogOpen(false);
  };

  const handleConfirmAction = () => {
    if (action === 'partial' && passwordInput === '_password') {
      partialResetDatabase();
    } else if (action === 'reservations' && passwordInput === '_password') {
      resetReservations();
    } else if (action === 'reset' && passwordInput === '_password') {
      resetDatabase();
    } else {
      // handle incorrect password
    }

    setPasswordDialogOpen(false);
  };

  const resetDatabase = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/reset-database?userId=${userId}`,
        {
          method: 'POST',
        }
      );
      const text = await response.text();
      setMessage(text);
    } catch (error) {
      setMessage('Error resetting the database');
    }
  };
  const partialResetDatabase = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/partial-reset-database?userId=${userId}`,
        {
          method: 'POST',
        }
      );
      const text = await response.text();
      setMessage(text);
    } catch (error) {
      setMessage('Error resetting the database');
    }
  };
  const resetReservations = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/reset-reservation-data?userId=${userId}`,
        {
          method: 'POST',
        }
      );
      const text = await response.text();
      setMessage(text);
    } catch (error) {
      setMessage('Error resetting the database');
    }
  };

  return (
    <>
      <div className='flex flex-col mt-4'>
        <h2 className='text-gray-500 font-semibold'>Database Actions</h2>
        <div className='flex gap-2 py-2'>
          <button
            className='px-4  rounded py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-200'
            onClick={() => handlePasswordDialogOpen('reservations')}
          >
            Reset Payments Data
          </button>
          <button
            className='px-4 rounded py-2 bg-indigo-50 text-indigo-700  hover:bg-indigo-200'
            onClick={() => handlePasswordDialogOpen('partial')}
          >
            Partial Reset Database
          </button>

          <button
            className='px-4  rounded py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-200'
            onClick={() => handlePasswordDialogOpen('reset')}
          >
            Full Reset Database
          </button>
        </div>
        <p className='text-red-300 text-sm'>{message}</p>
      </div>

      <Dialog
        open={passwordDialogOpen}
        onClose={handlePasswordDialogClose}
        aria-labelledby='password-dialog-title'
        aria-describedby='password-dialog-description'
      >
        <DialogTitle id='password-dialog-title'>
          {action === 'partial'
            ? 'Partial Reset Database'
            : action === 'reservations'
            ? 'Reset Sales Data'
            : 'Reset Database'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id='password-dialog-description'>
            Please enter the password to confirm this action.
          </DialogContentText>

          <TextField
            autoFocus
            margin='dense'
            id='password'
            label='Password'
            type='password'
            size='small'
            fullWidth
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePasswordDialogClose} color='primary'>
            Cancel
          </Button>
          <Button onClick={handleConfirmAction} color='primary'>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DatabaseActions;
