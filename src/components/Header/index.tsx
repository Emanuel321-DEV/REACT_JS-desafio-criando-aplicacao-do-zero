import Link from 'next/link';
import styles from './header.module.scss';

export default function Header(): JSX.Element {
  // TODO
  return (
    <Link href="/">
      <a className={styles.logoSpace}>
        <img src="/Logo.svg" alt="logo" />
      </a>
    </Link>
  );
}
