// __tests__/ReceivedList.test.js (or similar)

import React from "react";
import { render, screen, waitFor } from "@testing-library/react"; // React Testing Library
import userEvent from "@testing-library/user-event";
import ReceivedList from "./ReceivedList"; // Adjust path as needed
import axios from "axios"; // Import axios
import CryptoJS from "crypto-js";
// Mock axios
jest.mock("axios");

// Mock CryptoJS
jest.mock("crypto-js", () => ({
  AES: {
    decrypt: jest.fn().mockReturnValue({
      toString: jest.fn().mockReturnValue(JSON.stringify({ role: 4 })), // Mock decryption for testing
    }),
  },
  enc: {
    Utf8: {
      parse: jest.fn(), // Mock parse
    },
  },
}));

describe("ReceivedList Component", () => {
  const mockOrders = [
    { id: 1, customer_name: "Alice", order_name: "Order 1", category: 1 },
    { id: 2, customer_name: "Bob", order_name: "Order 2", category: 2 },
    { id: 3, customer_name: "Charlie", order_name: "Order 3", category: 1 },
  ];

  const mockCategories = [
    { id: 1, name: "Category A", role: 4 },
    { id: 2, name: "Category B", role: 5 },
  ];

  beforeEach(() => {
    // Mock localStorage
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(() => "fakeAuthToken"),
      },
      writable: true,
    });

    // Mock axios calls
    axios.get.mockImplementation((url) => {
      if (url.includes("/group/order/taken/")) {
        return Promise.resolve({ data: mockOrders });
      } else if (url.includes("/group/categories/")) {
        return Promise.resolve({ data: mockCategories });
      }
    });

    // Mock CryptoJS decryptData
    //const mockDecryptData = jest.fn(() => ({ role: 4 }));
    //CryptoJS.AES.decrypt = mockDecryptData
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  it("renders without crashing", async () => {
    render(<ReceivedList />);
    await waitFor(() => expect(axios.get).toHaveBeenCalled()); // Wait for data to load
  });

  it("filters orders based on user role", async () => {
    render(<ReceivedList />);
    await waitFor(() => expect(axios.get).toHaveBeenCalled()); // Wait for data to load

    // Should display orders with category role 4 (Category A)
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Charlie")).toBeInTheDocument();

    // Should NOT display orders with other category roles
    expect(screen.queryByText("Bob")).not.toBeInTheDocument();
  });

  it("displays all orders when user role is not available", async () => {
    // Mock localStorage getItem to return null auth_token
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(() => null), // No auth token
      },
      writable: true,
    });
    axios.get.mockImplementation((url) => {
      if (url.includes("/group/order/taken/")) {
        return Promise.resolve({ data: mockOrders });
      } else if (url.includes("/group/categories/")) {
        return Promise.resolve({ data: mockCategories });
      }
    });

    render(<ReceivedList />);
    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    // All orders should be visible
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("Charlie")).toBeInTheDocument();
  });

  it("displays 'هیچ سفارشی پیدا نشد' message when no orders are available", async () => {
    // Mock axios to return empty orders
    axios.get.mockImplementation((url) => {
      if (url.includes("/group/order/taken/")) {
        return Promise.resolve({ data: [] }); // No orders
      } else if (url.includes("/group/categories/")) {
        return Promise.resolve({ data: mockCategories });
      }
    });

    render(<ReceivedList />);
    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    expect(screen.getByText(/هیچ سفارشی/)).toBeInTheDocument();
  });

  it("handles API errors gracefully", async () => {
    // Mock axios to reject the promise
    axios.get.mockRejectedValue(new Error("API Error"));

    render(<ReceivedList />);

    // Wait for something to appear (like an error message). This can depend on your error handling
    await waitFor(() => {
      expect(screen.getByText(/API Error/i)).toBeInTheDocument(); // Check for some error message. You will need to add some error handling to your page
    });
  });
});
