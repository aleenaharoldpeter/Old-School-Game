// app/contributors/page.tsx
import styles from './page.module.css';
import { fetchGitHub } from './../../utils/github';
import Image from 'next/image';
import Link from 'next/link';

//  Define proper interfaces
interface Contributor {
    id: number;
    login: string;
    avatar_url: string;
    contributions: number;
}

interface CommitAuthor {
    name: string;
    date: string;
}

interface CommitCommit {
    author: CommitAuthor;
    message: string;
}

interface Commit {
    sha: string;
    html_url: string;
    author?: {
        login: string;
        avatar_url: string;
    };
    commit: CommitCommit;
}

//  Utility function
function getTimeAgo(date: string): string {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} minutes ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 48) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
    return `${Math.floor(hrs / 24)} days ago`;
}

function limitCommitMessage(message: string, limit = 20): string {
    return message.length > limit ? `${message.slice(0, limit)}...` : message;
}




export default async function ContributorsPage() {
    //  Strongly type the fetch responses
    const [contributors, commits] = await Promise.all([
        fetchGitHub<Contributor[]>('/repos/ajaynegi45/Old-School-Game/contributors'),
        fetchGitHub<Commit[]>('/repos/ajaynegi45/Old-School-Game/commits'),
    ]);

    return (
        <section className={styles.container}>
            <header className={styles.heading}>
                <h1>Project Contributors</h1>
                <p>Thanks to everyone who has contributed to making this project better!</p>
            </header>

            {/* Contributors Section */}
            <div className={styles.section}>
                <h2>Contributors</h2>
                <div className={styles.grid}>
                    {contributors.map((user: Contributor) => (
                        <Link
                            key={user.id}
                            href={`https://github.com/ajaynegi45/Old-School-Game/commits?author=${user.login}`}
                            className={styles.card}
                        >
                            <Image
                                src={user.avatar_url}
                                alt={user.login}
                                width={60}
                                height={60}
                                className={styles.avatar}
                                unoptimized
                            />
                            <p className={styles.username}>{user.login}</p>
                            <p>{user.contributions} Contributions</p>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Recent Commits Section */}
            <div className={styles.section}>
                <h2>Recent Commits</h2>
                <div className={styles.grid}>
                    {commits.slice(0, 6).map((commit: Commit) => (
                        <Link key={commit.sha} href={commit.html_url} className={styles.commitCard}>
                            <Image
                                src={commit.author?.avatar_url || '/placeholder-avatar.png'}
                                alt={commit.author?.login || 'unknown'}
                                width={40}
                                height={40}
                                className={styles.avatar}
                                unoptimized
                            />
                            <div className={styles.commitCardDetails}>
                                <p><strong>{commit.commit.author.name}</strong></p>
                                <p className={styles.message}>
                                    {limitCommitMessage(commit.commit.message)}
                                </p>
                                <p className={styles.time}>
                                    {getTimeAgo(commit.commit.author.date)}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>


            {/* Contributing Guidelines */}

            <div className={styles.section}>
                <div className={styles.Guidelines}>
                    <h2>Want to Contribute?</h2>
                    <p className={styles.contributeText}>
                        <br />  We welcome contributions from developers, educators, designers, 
                        and anyone passionate about how the mind works.<br />

                        <br /> This project may have started out as a game, but it’s grown into
                             something more meaningful. At its heart, it’s not just about 
                             playing, it’s about building things that keep the brain active, 
                             curious, and creative.<br />

                        <br />Think of the game as a doorway. What lies beyond it is the 
                        bigger mission: creating experiences and tools that actually strengthen 
                        the mind. That means there’s room here for a lot more than just game
                         mechanics.<br />

                        <br /> Why this is bigger than <b>just a game</b> <br />


                        <b>Brain health matters. </b> 
                         Just like regular exercise keeps the body strong, certain kinds of challenges
                          puzzles, strategy, creative problem-solving, keep the brain 
                         sharp and flexible.<br />

                        <br /> <b>It takes many minds to build for the mind.</b> <br />
                      

                        • Developers can bring interactive ideas to life.<br />

                        • Educators can shape challenges into meaningful learning.<br />

                        • Designers can make everything intuitive and engaging.<br />

                        • Cognitive scientists can guide us on what really helps memory, focus, and reasoning.<br />

                        • Writers and storytellers can create scenarios that spark imagination.<br />

                        <br />
                       We like to think of this project as a kind of digital <b>Brain Gym</b>.
                        A place where games, challenges, and creative tools come together
                         to make people just a little bit sharper, more focused, and more
                          inventive every time they engage..
                    </p>
                    <p className={styles.contributeText1}>
                        Check out our{" "}
                        <a href="https://github.com/ajaynegi45/Old-School-Game/blob/main/contributing.md" className={styles.link}>
                            Contributing Guidelines
                        </a>
                    </p>
                </div >
            </div>
        </section>
    );
}
