type Button2Props = {
  children: React.ReactNode;
};
const Button2 = ({ children }: Button2Props) => (
  <button className="bg-orange-500">{children}</button>
);

export { Button2 };
