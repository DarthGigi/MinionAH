export type CardData = {
  image: string;
  title: string;
  subTitle?: string;
  description: string;
  banner?: string;
  links: {
    name: string;
    url: string;
  }[];
  hidden?: boolean;
};
