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
                        <br />  We welcome meaningful contributions from developers, educators,
                        and cognitive science enthusiasts!<br />

                        <br /> <b>The contribution is not limited to a game,  it’s anything that helps in brain
                            development.</b> <br />
                        Your open-source project might have started as a game, but its core purpose is not just entertainment,
                        it’s about nurturing mental agility, problem-solving, and creative thinking through technology.<br />

                        <br />Think of it like this: <br />
                        The <b>game </b> is simply the medium — the bigger goal is to create experiences and tools
                        that strengthen the human mind. This opens the door for many types of contributions beyond
                        just writing game logic.<br />

                        <br />  Why it’s bigger than just a game: <br />


                        <b>Brain health matters as much as physical health</b> <br />
                        Just like exercise builds muscles, certain mental challenges stimulate brain regions
                        that improve memory, focus, reasoning, and creativity.<br />

                        <br /> Interdisciplinary collaboration <br />
                        A project focused on brain development benefits from:<br />

                        • Developers to build interactive tools<br />

                        • Educators to design content<br />

                        • Designers to create intuitive, stimulating interfaces<br />

                        • Cognitive scientists to guide brain-boosting mechanics<br />

                        • Writers to craft engaging scenarios that challenge creativity<br />

                        <br />
                        We are building an open, evolving <b>Brain Gym</b> — a digital space where games,
                        challenges, and creative tools work together to make people smarter, sharper, and
                        more imaginative.
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
