import * as React from 'react';
import styles from './index.module.css';

interface ComponentProps {
  /** Title for IceBlock. */
  title: string;
}

export default function IceBlock(props: ComponentProps) {
  const { title = 'Hello World!' } = props;

  return (
    <div className={styles.IceBlock}>{title}</div>
  );
}
