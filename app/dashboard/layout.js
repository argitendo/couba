export const metadata = {
  title: "Couba Dashboard",
  description: "Dashboard for Couba",
};

export default function RootLayout({ children }) {
  return (
    <div id="root">{children}</div>
  );
}