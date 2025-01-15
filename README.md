# Aplikacja do zarządzania czasem pracy. API - mikroserwisy ASP.NET core|fastAPI|spring-boot, front - mikrofrontendy angular

Jest to prosta aplikacja, która pozwala liczyć swój czas pracy. Liczba sesji pracy w ciągu dnia jest dowolna. Aplikacja pozwala przejrzeć swoje podsumowanie tygodnia, w którym jest napisane ile czasu danego dnia się pracowało oraz ile czasu się przepracowało w danym tygodniu. W podsumowaniu czasu pracy jest również lista użytkowników, dzięki której można sprawdzić czy dany kolega z pracy dzisiaj pracuje czy nie. Jest to komunikowane poprzez kropkę, która zapala się na żółto jeśli dany kolega z pracy obecnie pracuje. Aplikacja pozwala również przejrzeć swój i kolegów z pracy kalendarz nieobecności, dzięki któremu można się zorientować kiedy ma się jaką nieobecność oraz kiedy można się spodziewać kolegi z pracy, który aktualnie nie pracuje, a który jest potrzebny do konsultacji przy bieżącym projekcie.

Aplikacja została napisana w architekturze mikroserwisowej, w której za logowanie/rejestrację odpowiedzialny jest serwis napisany w spring boot, a za pozostałe operacje, chronione tokenem, serwisy napisane w pythonie, a konkretnie fastAPI oraz w C#, a konkretnie w ASP.NET core. Innymi słowy, API składa się z serwisów napisanych w trzech językach programowania. Frontend jest natomiast napisany w angularze w architekturze mikrofrontendowej.

Formularz logowania:
<img src="https://i.imgur.com/hageRap.gif">
Licznik czasu pracy:
<img src="https://i.imgur.com/kxivkYY.gif">
Podsumowanie tygodnia:
<img src="https://i.imgur.com/Y6arugH.gif">
Kalendarz:
<img src="https://i.imgur.com/6qX2ee5.gif">
<h4>Uruchomienie projektu</h4>
W pierwszej kolejności należy sprawdzić konfigurację bazy danych w pliku backend\authentication\src\main\resources\application.properties i upewnić się, że baza danych uruchomiona na komputerze zgadza się z tą konfiguracją, następnie w folderze backend\authentication należy w powershell uruchomić komendę:
<pre><code>mvn clean install</code></pre>
Następnie należy w folderze backend\calendar-service uruchomić komendy:
<pre><code>python -m venv venv</code></pre>
<pre><code>.\venv\Scripts\activate</code></pre>
<pre><code>pip install -r requirements.txt</code></pre>
W kolejnym etapie należy w folderze backend\time-service i wykonać komendę:
<pre><code>dotnet restore</code></pre>
Jeśli chodzi o front, to należy w katalogu fronted wykonać komendę:
<pre><code>npm install</code></pre>

Aby uruchomić projekt należy w głównym katalogu wykonać komendę:
<pre><code>.\start-services.bat</code></pre>

Po chwili wszystko zostanie uruchomione, a w międzyczasie utworzy się odpowiednia baza danych z kilkoma domyślnymi użytkownikami.

Przykładowy użytkownik to jan.kowalski@example.com hasło: haslo123