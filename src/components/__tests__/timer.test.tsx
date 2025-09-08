import { render, screen, fireEvent, act } from '@testing-library/react';
import Timer from '../timer';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

// Mock the hooks and modules
jest.mock('next-auth/react');
jest.mock('react-hot-toast');

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockToast = toast as jest.MockedFunction<typeof toast>;

describe('Timer Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock the session
    mockUseSession.mockReturnValue({
      data: { user: { id: '1', name: 'Test User', email: 'test@example.com' } },
      status: 'authenticated',
    });
    
    // Mock toast functions
    mockToast.success = jest.fn();
    mockToast.error = jest.fn();
  });

  test('renders with default props', () => {
    render(<Timer />);
    
    expect(screen.getByText('Timer')).toBeInTheDocument();
    expect(screen.getByText('00:00')).toBeInTheDocument();
    expect(screen.getByText('Start')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
  });

  test('renders with custom props', () => {
    render(<Timer initialMinutes={5} initialSeconds={30} title="Custom Timer" />);
    
    expect(screen.getByText('Custom Timer')).toBeInTheDocument();
    expect(screen.getByText('05:30')).toBeInTheDocument();
  });

  test('starts and pauses the timer', () => {
    jest.useFakeTimers();
    
    render(<Timer initialMinutes={1} initialSeconds={0} />);
    
    // Start the timer
    fireEvent.click(screen.getByText('Start'));
    expect(screen.getByText('Pause')).toBeInTheDocument();
    
    // Fast-forward time by 1 second
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    expect(screen.getByText('00:59')).toBeInTheDocument();
    
    // Pause the timer
    fireEvent.click(screen.getByText('Pause'));
    expect(screen.getByText('Start')).toBeInTheDocument();
    
    // Fast-forward time by 1 second (should not change as timer is paused)
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    expect(screen.getByText('00:59')).toBeInTheDocument();
    
    jest.useRealTimers();
  });

  test('resets the timer', () => {
    jest.useFakeTimers();
    
    render(<Timer initialMinutes={1} initialSeconds={0} />);
    
    // Start the timer
    fireEvent.click(screen.getByText('Start'));
    
    // Fast-forward time by 5 seconds
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    
    expect(screen.getByText('00:55')).toBeInTheDocument();
    
    // Reset the timer
    fireEvent.click(screen.getByText('Reset'));
    
    expect(screen.getByText('01:00')).toBeInTheDocument();
    expect(screen.getByText('Start')).toBeInTheDocument();
    
    jest.useRealTimers();
  });

  test('completes the timer and shows notification', () => {
    jest.useFakeTimers();
    
    render(<Timer initialMinutes={0} initialSeconds={2} />);
    
    // Start the timer
    fireEvent.click(screen.getByText('Start'));
    
    // Fast-forward time by 2 seconds
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    
    expect(screen.getByText('00:00')).toBeInTheDocument();
    expect(screen.getByText('Timer completed!')).toBeInTheDocument();
    expect(screen.getByText('Restart')).toBeInTheDocument();
    
    // Check if toast.success was called
    expect(mockToast.success).toHaveBeenCalledWith('Timer has finished!');
    
    jest.useRealTimers();
  });

  test('enters edit mode and saves changes', () => {
    render(<Timer initialMinutes={1} initialSeconds={0} />);
    
    // Enter edit mode
    fireEvent.click(screen.getByText('Edit'));
    
    // Change the minutes
    const minutesInput = screen.getByLabelText('Minutes');
    fireEvent.change(minutesInput, { target: { value: '2' } });
    
    // Save the changes
    fireEvent.click(screen.getByText('Save'));
    
    expect(screen.getByText('02:00')).toBeInTheDocument();
  });

  test('cancels edit mode', () => {
    render(<Timer initialMinutes={1} initialSeconds={0} />);
    
    // Enter edit mode
    fireEvent.click(screen.getByText('Edit'));
    
    // Change the minutes
    const minutesInput = screen.getByLabelText('Minutes');
    fireEvent.change(minutesInput, { target: { value: '2' } });
    
    // Cancel the changes
    fireEvent.click(screen.getByText('Cancel'));
    
    expect(screen.getByText('01:00')).toBeInTheDocument();
  });

  test('shows validation error for invalid time in edit mode', () => {
    render(<Timer />);
    
    // Enter edit mode
    fireEvent.click(screen.getByText('Edit'));
    
    // Change the seconds to an invalid value
    const secondsInput = screen.getByLabelText('Seconds');
    fireEvent.change(secondsInput, { target: { value: '70' } });
    
    // Try to save
    fireEvent.click(screen.getByText('Save'));
    
    expect(mockToast.error).toHaveBeenCalledWith('Please enter a valid time');
  });
});