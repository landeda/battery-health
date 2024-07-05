import { FC, ReactNode } from 'react';

type MainProps = {
  children: ReactNode;
};

export const Main: FC<MainProps> = ({ children }) => (
  <main className="rounded-2xl mb-2">{children}</main>
);
