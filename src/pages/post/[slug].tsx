/* eslint-disable react/no-danger */
/* eslint-disable no-param-reassign */
/* eslint-disable no-return-assign */
import { GetStaticPaths, GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { FaCalendar, FaClock, FaUser } from 'react-icons/fa';
import { RichText } from 'prismic-dom';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../../components/Header/index';
import { getPrismicClient } from '../../services/prismic';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <h1>Carregando...</h1>;
  }

  const countWords = post.data.content.reduce((acc, currentValue) => {
    acc += currentValue.heading.split(' ').length;

    const words = currentValue.body.map(item => item.text.split(' ').length);

    words.map(word => (acc += word));

    return acc;
  }, 0);

  const timeRead = Math.ceil(countWords / 200);

  const dateFormatted = format(
    new Date(post.first_publication_date),
    'dd MMM yyyy',
    {
      locale: ptBR,
    }
  );

  return (
    <>
      <Head>
        <title>{`${post.data.title} | spacetraveling`}</title>
      </Head>

      <Header />
      <div className={styles.image}>
        <img src={post.data.banner.url} alt="imagem" />
      </div>
      <main className={commonStyles.container}>
        <article className={commonStyles.articles}>
          <h1 className={styles.title_post}>{post.data.title}</h1>

          <ul className={styles.data_author_post}>
            <li className={styles.time_post}>
              <FaCalendar />
              <span>{dateFormatted}</span>
            </li>
            <li className={styles.author_post}>
              <FaUser />
              <span>{post.data.author} </span>
            </li>
            <li className={styles.time_read_post}>
              <FaClock />
              <span>{`${timeRead} min`}</span>
            </li>
          </ul>

          {post.data.content.map(content => {
            return (
              <article key={content.heading}>
                <h2 className={styles.title_content_post}>{content.heading}</h2>
                <div
                  className={styles.article_post}
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(content.body),
                  }}
                />
              </article>
            );
          })}
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();

  const { results } = await prismic.query([
    Prismic.predicates.at('document.type', 'posts'),
  ]);

  const paths = results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };

  // TODO
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: [...content.body],
        };
      }),
    },
  };

  // TODO

  return {
    props: {
      post,
    },
  };
};
