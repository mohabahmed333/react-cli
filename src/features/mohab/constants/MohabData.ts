import { TOrder, Mohabtatus } from "../types/Mohab";
/* eslint-disable sonarjs/no-duplicate-string */
export const MohabData: TOrder[] = [
  {
    id: "1",
    orderId: "#ORD-2025-001",
    customer: {
      name: "Abdullah Hamed",
      phone: "+096550001234"
    },
    amount: 100,
    status: Mohabtatus.Processing,
    date: new Date("2024-01-15")
  },
  {
    id: "2",
    orderId: "#ORD-2025-002",
    customer: {
      name: "Mohammed Ali",
      phone: "+096551112233"
    },
    amount: 75.5,
    status: Mohabtatus.Delivered,
    date: new Date("2024-01-14")
  },
  {
    id: "3",
    orderId: "#ORD-2025-003",
    customer: {
      name: "Fatima Ahmed",
      phone: "+096552223344"
    },
    amount: 120.75,
    status: Mohabtatus.Cancelled,
    date: new Date("2024-01-13")
  },
  {
    id: "4",
    orderId: "#ORD-2025-004",
    customer: {
      name: "Omar Khaled",
      phone: "+096553334455"
    },
    amount: 45.25,
    status: Mohabtatus.Delivered,
    date: new Date("2024-01-12")
  },
  {
    id: "5",
    orderId: "#ORD-2025-005",
    customer: {
      name: "Layla Hassan",
      phone: "+096554445566"
    },
    amount: 210,
    status: Mohabtatus.Processing,
    date: new Date("2024-01-11")
  },
  {
    id: "6",
    orderId: "#ORD-2025-006",
    customer: {
      name: "Layla Hassan",
      phone: "+096554445566"
    },
    amount: 210,
    status: Mohabtatus.Processing,
    date: new Date("2024-01-11")
  },
  {
    id: "7",
    orderId: "#ORD-2025-007",
    customer: {
      name: "Layla Hassan",
      phone: "+096554445566"
    },
    amount: 210,
    status: Mohabtatus.Processing,
    date: new Date("2024-01-11")
  },
  {
    id: "8",
    orderId: "#ORD-2025-008",
    customer: {
      name: "Layla Hassan",
      phone: "+096554445566"
    },
    amount: 210,
    status: Mohabtatus.Processing,
    date: new Date("2024-01-11")
  },
  {
    id: "9",
    orderId: "#ORD-2025-009",
    customer: {
      name: "Layla Hassan",
      phone: "+096554445566"
    },
    amount: 210,
    status: Mohabtatus.Processing,
    date: new Date("2024-01-11")
  },
  {
    id: "10",
    orderId: "#ORD-2025-010",
    customer: {
      name: "Layla Hassan",
      phone: "+096554445566"
    },
    amount: 210,
    status: Mohabtatus.Processing,
    date: new Date("2024-01-11")
  }
];
