import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, Box, Button, Typography } from '@mui/material';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Something went wrong
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {this.state.error?.message || 'An unexpected error occurred'}
            </Typography>
            <Button 
              variant="outlined" 
              onClick={this.handleReset}
              sx={{ mt: 1 }}
            >
              Try Again
            </Button>
          </Alert>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
