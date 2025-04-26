'use client';

import { useParams } from 'next/navigation';
import '../../../learnpage.css';;

export default function LearnPage() {
  const params = useParams();
  const { language, level } = params;

  return (
    <div className='container'>
      <h1 className='title'>Welcome to the {level} level of {language.charAt(0).toUpperCase() + language.slice(1)} learning!</h1>
    </div>
  );
}